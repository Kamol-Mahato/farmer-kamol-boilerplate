declare module "bwip-js" {
    interface BwipOptions {
      bcid: string
      text: string
      scale?: number
      height?: number
      width?: number
      includetext?: boolean
      backgroundcolor?: string
    }
    function toBuffer(opts: BwipOptions): Promise<Buffer>
    export = { toBuffer }
  }