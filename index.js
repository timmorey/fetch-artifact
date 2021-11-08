const { Octokit } = require('octokit')
const fs = require('fs')
const https = require('https')
const parseArgs = require('minimist')

const args = parseArgs(process.argv.slice(2))

const [ owner, repo ] = args['repo'].split('/')
const artifactName = args['name']
const token = args['token']

const octokit = new Octokit({ auth: token })

getArtifactMetadata(owner, repo)
  .then(artifacts => latestArtifactWithName(artifacts, artifactName))
  .then(artifact => downloadArtifact(owner, repo, artifact))

async function getArtifactMetadata(owner, repo) {
  const per_page = 100
  let result = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', { owner, repo, per_page })
  let artifacts = result.data.artifacts
  // TODO: don't need to download all, just until we see the first one with the right name
  // it sure looks like they're sorted by id and created_at
  // while (artifacts.length < result.data.total_count) {
  //   const page = Math.floor(artifacts.length / per_page) + 1
  //   // console.log(`page ${page}`)
  //   result = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', { owner, repo, per_page, page })
  //   artifacts = [ ...artifacts, ...result.data.artifacts ]
  // }
  // console.log(`total_count=${result.data.total_count}, found=${artifacts.length}`)
  return artifacts
}

function latestArtifactWithName(artifacts, name) {
  return artifacts
    .filter(artifact => artifact.name === name)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
}

async function downloadArtifact(owner, repo, artifact) {
  const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
    owner,
    repo,
    artifact_id: artifact.id,
    archive_format: 'zip',
  })
  fs.createWriteStream('out.zip').write(Buffer.from(response.data))
}
