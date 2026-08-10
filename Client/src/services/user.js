import api from '@/utils/api'
import { toast } from 'sonner';

export async function registerUser(userData){
    try {

     console.log(userData);
     const response =  await api.post('/auth/signup',userData,
        {headers: {
            "Content-Type": "multipart/form-data",
        }}
     )
     return response.data
        
    } catch (error) {
        
        toast.error(error.message);
        return error.response.data
    }
}

export async function loginUser(userData){
    try {

     
     const response =  await api.post('/auth/signin', userData)
     return response.data
        
    } catch (error) {

        return error.response.data
    }
}

export async function getcandidateProfile() {

    try {

     const response =  await api.get("/candidate/profile");
     console.log(response.data);

     return response.data
        
    } catch (error) {

        console.log(error.response)
        return error.response.data
    }    
}

export async function analyzeCandidateProfile() {
  try {
    const response = await api.post("/candidate/profile/analyze");
    return response.data;
  } catch (error) {
    console.log(error.response);
    return error.response.data;
  }
}
export async function updateCandidateProfile(profile) {
    
    try {

     const response =  await api.put("/candidate/profile", profile);

     return response.data
        
    } catch (error) {

        console.log(error.response)
        return error.response.data
    }

}