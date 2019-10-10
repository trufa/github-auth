import { NowRequest, NowResponse } from '@now/node'
import { Photon } from '@generated/photon'


export default async function(req: NowRequest, res: NowResponse) {
  res.json("hi")
}
