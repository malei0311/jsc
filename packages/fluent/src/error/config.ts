export enum ERROR_TYPE {
  E_UNKNOWN = 'E_UNKNOWN',
  E_JSC_PATH_NOT_SPECIFIED = 'E_JSC_PATH_NOT_SPECIFIED',
  E_JSC_PATH_NOT_FOUND = 'E_JSC_PATH_NOT_FOUND',
  E_JSC_EXEC_FAILED = 'E_JSC_EXEC_FAILED',
  E_JSC_FILES_OR_CODE_NOT_SPECIFIED = 'E_JSC_FILES_OR_CODE_NOT_SPECIFIED',
}

type ErrorConfig = {
  [type in ERROR_TYPE]: [code: number, msg: string];
};

export const ERROR_CONFIG: ErrorConfig = {
  [ERROR_TYPE.E_UNKNOWN]: [0, 'unknown error'],
  [ERROR_TYPE.E_JSC_PATH_NOT_SPECIFIED]: [1, 'jsc path not specified'],
  [ERROR_TYPE.E_JSC_PATH_NOT_FOUND]: [2, 'jsc path not found'],
  [ERROR_TYPE.E_JSC_EXEC_FAILED]: [3, 'jsc exec failed'],
  [ERROR_TYPE.E_JSC_FILES_OR_CODE_NOT_SPECIFIED]: [4, 'jsc files or code not specified'],
};
