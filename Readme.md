# PLEASE NOTE! This is in active development and not yet ready to be used, nor does it currently do everything it says it does. Please feel free to watch the repo and wait for an official release.


# Google Drive Rclone-Crypt Video Streaming Server

This server is designed to serve your Rclone-Encrypted Google Drive as a video streaming service, rather than needing to FUSE mount and point a normal media server at it.

It efficiently streams and decrypts on the fly, so as not to waste bandwidth or local disk space.

## Env vars

Environment variables can be provided either as a `.env` file in the project directory, or by passing it via Docker, or preferably, both!
The example `docker-compose.yml` assumes you have a `.env` file in the directory already set up.

| Env Var            | Value                         |Notes|
|--------------------|-------------------------------|-----|
| `RCLONE_PASSWORD`  | Can be found in `rclone.conf` |     |
| `RCLONE_PASSWORD2` | Can be found in `rclone.conf` |     |
| `TEAM_DRIVES`      | A comma-separated list of [team drive ID's](https://github.com/Makeshift/Marauder/wiki/Getting-Started%3A-1.-Google-Services#creating-team-drives) | If ommitted, we default to your personal drive if using Oauth2, or fail if using service accounts |
| `ENCRYPTED_FOLDER` | The plaintext name of the folder your encrypted data resides in. If you use [Marauder](https://github.com/Makeshift/Marauder), this is probably just `encrypted`. This must be consistent between all drives. | |

### Google Drive Authentication

This server supports two authentication methods: Either via Client ID/Secret, or using service accounts. **You only need one.** Service accounts are the recommended option, as this makes it very easy to allow many service accounts access to many team drives at once.

#### Service Accounts

The server should support the following authentication methods, though not all have been extensively tested:

* Multiple team drives using service accounts
* A single team drive using service accounts
* A single personal drive using Oauth2 (Client ID / Secret)
* A single team drive using Oauth2 (Client ID / Secret)

If a client ID and secret is not provided, then it is assumed you are using service accounts. Folders are checked in the order given below - if they exist, it will try to use them.

Check the [Rclone documentation](https://rclone.org/drive/#use-case-google-apps-g-suite-account-and-individual-drive) to learn how to create service accounts, or the [Marauder wiki page](https://github.com/Makeshift/Marauder/wiki/Getting-Started%3A-1.-Google-Services#configure-google-cloud--google-admin) to generate them en-masse. Having multiple is recommended.

##### Docker

Mount a folder containing the service account `.json` files to `/service_accounts` in the container.

##### Not Docker

Create a folder in the same directory as this `Readme.md` named `service_accounts`. Put all the `.json` files in there.

#### Client ID / Secret

Out of respect for the Rclone dev, we are not using their client ID/secret. You can view [their documentation](https://rclone.org/drive/#making-your-own-client-id) on how to make your own.

Note that using this method, at this time you can only access a single personal/team drive. (I _might_ be able to make it so it can search all team drives for the given file with oauth, but that would be opt-in as there's no way to exclude other shared drives from that.)

You should then use Rclone to create a new auth block by creating a new remote. If an option is ommitted from below, then it can simply be left as the default.

* Run `rclone config`
* Enter `n` to create a new remote
* Enter an arbitrary name
* Select `Google Drive` (17, at the time of writing)
* Enter the `client_id` and `client_secret` when prompted
* `drive.readonly` is the recommended scope
* The `Service account` can be left empty if using this method
* Continue following the prompts as needed to give the client access
* Rclone will ask if this is a team drive. Answer appropriately and select the team drive you'd like to use if so. Note that with this particular setup, we will only support a single team drive at a time (at the moment).
* Rclone will output its generated config. Copy the JSON blob after `token = ` to use as the `DRIVE_TOKEN` environment variable.

Provide the following environment variables:

| Env Var            | Value                         |
|--------------------|-------------------------------|
| `DRIVE_CLIENT_ID`  | Can be found in `rclone.conf` |
| `DRIVE_CLIENT_SECRET` | Can be found in `rclone.conf` |
| `DRIVE_TOKEN` | Described above |
