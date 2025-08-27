import { Request, Response, NextFunction } from "express";
import { ValidationChain, validationResult } from "express-validator";

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 运行所有验证
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors: ValidationError[] = errors
        .array()
        .map((error) => ({
          field: error.type === "field" ? error.path : "unknown",
          message: error.msg,
          value: error.type === "field" ? error.value : undefined,
        }));

      res.status(400).json({
        success: false,
        message: "输入验证失败",
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    return next();
  };
};
