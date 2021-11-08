#!/usr/bin/env node

const StreamZip = require('node-stream-zip')
const fs = require('fs')
const parseArgs = require('minimist')
const { Octokit } = require('octokit')

const args = parseArgs(process.argv.slice(2))

const [ owner, repo ] = args['repo'].split('/')
const artifactName = args['name']
const token = args['token']

const octokit = new Octokit({ auth: token })

getArtifactMetadata(octokit, owner, repo)
  .then(artifacts => latestArtifactWithName(artifacts, artifactName))
  .then(artifact => downloadArtifact(octokit, owner, repo, artifact))

async function getArtifactMetadata(octokit, owner, repo) {
  const per_page = 100
  let result = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', { owner, repo, per_page })
  let artifacts = result.data.artifacts
  // TODO: do we need to download all if we want the latest?  It sure looks like they're sorted by id and created_at
  while (artifacts.length < result.data.total_count) {
    const page = Math.floor(artifacts.length / per_page) + 1
    result = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', { owner, repo, per_page, page })
    artifacts = [ ...artifacts, ...result.data.artifacts ]
  }
  return artifacts
}

function latestArtifactWithName(artifacts, name) {
  return artifacts
    .filter(artifact => artifact.name === name)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
}

async function downloadArtifact(octokit, owner, repo, artifact) {
  const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
    owner,
    repo,
    artifact_id: artifact.id,
    archive_format: 'zip',
  })
  fs.writeFileSync('temp.zip', Buffer.from(response.data))
  const zip = new StreamZip.async({ file: 'temp.zip' })
  await zip.extract(null, './')
  await zip.close()
  fs.rmSync('temp.zip')
}
