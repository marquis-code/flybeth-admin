import { GATEWAY_ENDPOINT } from '../axios.config'

export const departmentApiFactory = {
  getDepartments: () => GATEWAY_ENDPOINT.get('/departments'),
  createDepartment: (data: any) => GATEWAY_ENDPOINT.post('/departments', data),
  updateDepartment: (id: string, data: any) => GATEWAY_ENDPOINT.put(`/departments/${id}`, data),
  deleteDepartment: (id: string) => GATEWAY_ENDPOINT.delete(`/departments/${id}`),
  addMember: (id: string, userId: string) => GATEWAY_ENDPOINT.post(`/departments/${id}/members`, { userId }),
  removeMember: (id: string, userId: string) => GATEWAY_ENDPOINT.delete(`/departments/${id}/members/${userId}`)
}
