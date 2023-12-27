import requestService from "./request.service";
import {TemplateSubmissionType} from "../types/submission";
import {PaginatedResponse} from "../types/api";

const getTemplates = async (name: string) => {
  return requestService.get<PaginatedResponse<TemplateSubmissionType>>(`/api/templates/?q=${name}`)
}

const TemplateService = {
  getTemplates,
}

export default TemplateService
