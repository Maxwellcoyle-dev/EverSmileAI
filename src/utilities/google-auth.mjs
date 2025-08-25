// googleAuth.mjs
import { google } from "googleapis";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});

const googleAuth = async ({
  secretId = process.env.GDRIVE_SA_SECRET_ID ?? "gdrive-sa-key",
  sharedDriveId = process.env.SHARED_DRIVE_ID,
} = {}) => {
  try {
    // 1) Read SA key JSON from Secrets Manager
    const { SecretString } = await sm.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );
    if (!SecretString) throw new Error("Secret has no SecretString");

    // Parse the secret string - it might be nested under a key name
    let key;
    try {
      const parsed = JSON.parse(SecretString);
      // If the secret is nested under a key name, extract the actual value
      if (parsed[secretId]) {
        key = JSON.parse(parsed[secretId]);
      } else {
        key = parsed;
      }
    } catch (parseError) {
      throw new Error(`Failed to parse secret: ${parseError.message}`);
    }

    console.log("key", key);
    console.log("secretId", secretId);
    console.log("sharedDriveId", sharedDriveId);

    // 2) Build JWT client (the library handles token exchange)
    const jwt = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    await jwt.authorize();

    // 3) Drive client
    const drive = google.drive({ version: "v3", auth: jwt });

    // 4) If we don't know the Shared Drive ID yet, list drives
    if (!sharedDriveId) {
      const res = await drive.drives.list({ pageSize: 10 });
      return {
        ok: true,
        serviceAccount: key.client_email,
        drives: res.data.drives ?? [],
      };
    }

    // 5) Otherwise, list some files within that Shared Drive
    const filesRes = await drive.files.list({
      corpora: "drive",
      driveId: sharedDriveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      pageSize: 10,
      fields: "files(id,name,mimeType)",
    });

    return {
      ok: true,
      serviceAccount: key.client_email,
      files: filesRes.data.files ?? [],
    };
  } catch (e) {
    const msg =
      e?.response?.data?.error?.message ??
      e?.message ??
      (typeof e === "string" ? e : "Unknown error");
    return { ok: false, error: msg };
  }
};

export default googleAuth;
