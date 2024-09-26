declare module "use-react-screenshot" {
  type UseScreenshot = (options: {
    type: "image/jpeg" | "image/png";
    quality: number; // between 0 and 1
  }) => [string | null, (ref: HTMLDivElement) => void];

  declare const useScreenshot: UseScreenshot;

  export { useScreenshot };
}
