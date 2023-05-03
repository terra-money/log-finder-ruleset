import { LogFinderActionResult } from "./types"

export const collector = (result: LogFinderActionResult[] | undefined) => {
  const returnArray: LogFinderActionResult[] = []

  if (result) {
    result.forEach((value) => {
      if (value.transformed) {
        const action = value.transformed.msgType?.split("/")[1]
        const types = [
          "transfer",
          "send",
          "delegate",
          "undelegate",
          "begin-redelegate",
          "withdraw-delegation-reward"
        ]

        if (!types.includes(action)) {
          returnArray.push(value)
        }
      }
    })
  }

  if (returnArray.length <= 0 && result) {
    return result
  } else {
    return returnArray
  }
}
