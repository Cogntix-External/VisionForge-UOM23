import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export async function GET(request, { params }) {
  const { projectId, taskId, attachmentId } = params;
  const token = request.cookies.get("crms_token")?.value;
  const companyId = request.nextUrl.searchParams.get("companyId");

  const endpoint =
    `${API_BASE}/company/kanban/${encodeURIComponent(
      projectId
    )}/tasks/${encodeURIComponent(taskId)}/attachments/${encodeURIComponent(
      attachmentId
    )}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(companyId ? { "X-Company-Id": companyId } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    });
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");
  const contentLength = response.headers.get("content-length");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (contentDisposition) {
    headers.set("content-disposition", contentDisposition);
  }

  if (contentLength) {
    headers.set("content-length", contentLength);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
