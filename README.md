# fetch-artifact

This package contains a simple script that will download the latest version a GitHub artifact with a given name.  The downloaded artifact will be placed in the current directory.

## Usage

To download the most recent artifact named `my-artifact` from this repository and save the downloaded files to the current directory, run

```
npx fetch-artifact --repo timmorey/fetch-artifact --name my-artifact --token <my-personal-access-token>
```

### Arguments

| Name | Description | Required |
| --- | --- | --- |
| <nobr>`--repo`</nobr> | The combined owner/org and repository name.  For example, `timmorey/fetch-artifact`. | yes |
| <nobr>`--name`</nobr> | The artifact name | yes |
| <nobr>`--token`</nobr> | A [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) that has "repo" scope. | yes |