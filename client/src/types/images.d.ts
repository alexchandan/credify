declare module "*.png" {
  const source: import("next").StaticImageData;
  export default source;
}
