import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const getSession = async () => {
  return await getServerSession(authOptions);
};
