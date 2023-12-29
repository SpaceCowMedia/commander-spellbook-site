import requestService from "./request.service";
import {TemplateSubmissionType} from "../types/submission";
import {PaginatedResponse, TemplateResponseType} from "../types/api";

const getTemplates = async (name: string) => {
  return requestService.get<PaginatedResponse<TemplateResponseType>>(`/api/templates/?q=${name}`)
}

const TemplateService = {
  getTemplates,
}

export default TemplateService
