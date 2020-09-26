import Api from '@/services/api'

export default {
  queryAll() {
    return Api().get('queryAll')
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(selected) {
    return Api().post('queryWithQueryString', {
      selected: selected
    }) 
  },
  registerPatient(patientId, registrarId, fullName) {
    return Api().post('registerPatient', {
      patientId: patientId,
      password: password,
      fullName: fullName
      
    }) 
  },
  validatePatient(patientID) {
    return Api().post('validatePatient', {
      patientID: patientID
    }) 
  },
  queryByKey(key) {
    return Api().post('queryByKey', {
      key: key
    }) 
  },
  getCurrentStanding() {
    return Api().get('getCurrentStanding')
  }
}``