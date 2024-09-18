"use client";

import { useScreenStateStore } from "@/store/gameOfLifeStore";
import { ScreenType } from "@/utils/constants";
import Board from "@/components/Board";
import Menu from "@/components/Menu";

export default function Home() {
  const screenState = useScreenStateStore();

  return <>{screenState.screen === ScreenType.Menu ? <Menu /> : <Board />}</>;
}
