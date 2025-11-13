import { isAdminTokenValid } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(4),
});

export const POST = async (request: Request) => {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ valid: false }, { status: 422 });
  }

  const valid = isAdminTokenValid(parsed.data.token);
  return Response.json({ valid });
};

