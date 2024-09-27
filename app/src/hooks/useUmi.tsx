import { useContext } from "react";
import { UmiContext } from "@/providers/UmiContext";

export default function useUmi() {
  const umi = useContext(UmiContext).umi;
  const dasApiRpc = useContext(UmiContext).dasApiRpc;

  return { umi, dasApiRpc };
}
