import { NowRequest, NowResponse } from '@now/node'
import { Client } from 'pg'
const client = new Client()

client.connect()

export default async function(req: NowRequest, res: NowResponse) {
  const { reference } = req.query

  if (!reference) {
    return res.json({
      token: null,
    })
  }

  try {
    const selectQuery = {
      text: 'SELECT token, used FROM public.tokens WHERE reference = $1::text;',
      values: [reference],
    }

    const result = await client.query(selectQuery)
    const { token, used } = result.rows[0];

    if (used) {
      return res.json({
        error: 'Reference was already used',
        token: null,
      })
    }

    const updateQuery = {
      text: 'UPDATE public.tokens SET used = true WHERE reference = $1::text;',
      values: [reference],
    }

    await client.query(updateQuery)

    res.json({
      error: null,
      token,
    })
  } catch (e) {
    res.json({
      error: e.message,
      token: null,
    })
  }
}
