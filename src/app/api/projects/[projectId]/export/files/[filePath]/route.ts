import { createExportComponent } from "@/util/file-construction";
import { Client, File, FileStateItem } from "@/util/storage";
import { getInitialStateValueString } from "@/util/util";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const client = new Client({ cookies });

  const contents = createExportComponent(
    await client.getFile(parseInt(params.projectId), params.filePath)
  );

  return new Response(contents, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
