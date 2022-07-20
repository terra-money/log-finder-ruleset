import {
  ReturningLogFinderTransformer,
  LogFinderRule,
  LogFragment,
} from "@terra-money/log-finder"

export interface Action {
  msgType: string
  canonicalMsg: string[]
  payload: LogFragment
}

export interface Amount {
  type: string
  amount: string
  sender?: string
  recipient?: string
  withdraw_date?: string
}

export interface LogFindersActionRuleSet {
  rule: LogFinderRule
  transform: ReturningLogFinderTransformer<Action>
}

export interface LogFindersAmountRuleSet {
  rule: LogFinderRule
  transform: ReturningLogFinderTransformer<Amount>
}

export interface LogFinderActionResult {
  fragment: LogFragment
  match: {
    key: string
    value: string
  }[]
  height?: number
  transformed?: Action
  txhash?: string
}

export interface LogFinderAmountResult {
  timestamp: string
  fragment: LogFragment
  match: {
    key: string
    value: string
  }[]
  height?: number
  transformed?: Amount
  txhash?: string
}

export interface TxEvent {
  type: string
  attributes: {
    key: string
    value: string
  }[]
}

export interface TxLog {
  msg_index: number
  log: string
  events: TxEvent[]
}

export type Message = any

export interface Tx {
  body: {
    messages: Message[]
    memo?: string
  }
  auth_info: {
    fee: any
  }
}

export interface Transaction {
  height: number
  txhash: string
  raw_log: string
  logs: TxLog[] | undefined
  gas_wanted: number
  gas_used: number
  tx: Tx
  timestamp: string
  code?: number | undefined
  codespace?: string | undefined
}
