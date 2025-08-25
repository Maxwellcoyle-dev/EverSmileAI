// If your package.json sets "type":"module", use this import style.
// Otherwise switch to require(...) in CJS.
import { google } from "googleapis";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});

async function getDriveClientReadonly() {
  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: "gdrive-sa-key" })
  );
  if (!SecretString) throw new Error("Missing SA secret");
  const key = JSON.parse(SecretString);

  // Build a JWT client using the SA private key; library handles token minting
  const jwt = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  await jwt.authorize();

  return google.drive({ version: "v3", auth: jwt });
}

export const handler = async () => {
  const drive = await getDriveClientReadonly();

  // If you don't know the Shared Drive ID yet, list them:
  if (!process.env.SHARED_DRIVE_ID) {
    const list = await drive.drives.list({ pageSize: 10 });
    return (list.data.drives || []).map((d) => ({ name: d.name, id: d.id }));
  }

  // Otherwise, list first few files in that Shared Drive
  const driveId = process.env.SHARED_DRIVE_ID;
  const files = await drive.files.list({
    corpora: "drive",
    driveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    pageSize: 10,
    fields: "files(id,name,mimeType)",
  });

  return { files: files.data.files };
};
