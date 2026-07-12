import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import * as companyService from "./company.service.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "./company.validation.js";

export async function createCompany(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.body as CreateCompanyInput;
  const company = await companyService.createCompany(req.user!.userId, input);
  sendSuccess(res, {
    data: company,
    message: "Company created",
    statusCode: 201,
  });
}

export async function getCompanyById(
  req: Request,
  res: Response,
): Promise<void> {
  const company = await companyService.getCompanyById(req.params.id as string);
  sendSuccess(res, { data: company });
}

export async function updateCompany(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.body as UpdateCompanyInput;
  const company = await companyService.updateCompany(
    req.user!.userId,
    req.params.id as string,
    input,
  );
  sendSuccess(res, { data: company, message: "Company updated" });
}

export async function uploadLogo(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(400, "VALIDATION_ERROR", "No logo file provided");
  }
  const company = await companyService.uploadLogo(
    req.user!.userId,
    req.params.id as string,
    req.file.buffer,
  );
  sendSuccess(res, { data: company, message: "Logo uploaded" });
}
