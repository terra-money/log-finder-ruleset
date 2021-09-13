import { LogFinderActionResult } from "./types"

export const collector = (result: LogFinderActionResult[]) => {
  const returnArray: LogFinderActionResult[] = []
  result.forEach((value) => {
    if (value.transformed) {
      const action = value.transformed?.msgType?.split("/")[1]
      const types = [
        "transfer",
        "send",
        "delegate",
        "undelegate",
        "begin-redelegate",
      ]

      if (!types.includes(action)) {
        returnArray.push(value)
      }
    }
  })

  return returnArray.length > 0 ? returnArray : result
}
