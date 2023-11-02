import requestService from "./request.service";
import {PaginatedResponse} from "../types/api";
import {FeatureType} from "../types/feature";

const getFeatures = async (name: string) => {
  return requestService.get<PaginatedResponse<FeatureType>>(`/api/features/?q=${name}`)
}

const FeatureService = {
  getFeatures,
}

export default FeatureService
