import requestService from "./request.service";

type UserResponseType = {
  id: number
  username: string
  email: string
  isStaff: boolean
  isActive: boolean
  firstName: string
  lastName: string
}
const getPrivateUser = async (userId: string | number) => {
  return requestService.get<UserResponseType>(`/api/users/${userId}`)
}


const UserService = {
  getPrivateUser,
}

export default UserService
