import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const googleAuth = async () => {
  try {
    // Validate AWS identity first
    const stsClient = new STSClient({});
    const id = await stsClient.send(new GetCallerIdentityCommand({}));
    console.log("AWS Caller Identity ARN:", id.Arn);
    console.log("AWS Account ID:", id.Account);
    console.log("AWS User ID:", id.UserId);

    // Continue with Google Auth if AWS validation passes
    const externalAccountConfig = JSON.parse(process.env.GCP_WIF_CONFIG);

    const auth = new GoogleAuth({
      credentials: externalAccountConfig,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const client = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: client });

    // 1) Prove WIF works: list Shared Drives visible to the SA
    const drives = await drive.drives.list({ pageSize: 10 });
    const summary = (drives.data.drives || []).map((d) => ({
      name: d.name,
      id: d.id,
    }));

    // Optionally: use a specific Shared Drive ID (paste to env once you know it)
    let files = [];
    const driveId = process.env.SHARED_DRIVE_ID;
    if (driveId) {
      const res = await drive.files.list({
        corpora: "drive",
        driveId,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 10,
        fields: "files(id,name,mimeType)",
      });
      files = res.data.files || [];
    }

    return {
      awsIdentity: {
        arn: id.Arn,
        accountId: id.Account,
        userId: id.UserId,
      },
      drives: summary,
      sampleFiles: files,
    };
  } catch (error) {
    console.error("Error in googleAuth:", error);
    throw error;
  }
};

export default googleAuth;
