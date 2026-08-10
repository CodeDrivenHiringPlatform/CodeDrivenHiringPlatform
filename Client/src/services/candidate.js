import api from '@/utils/api';
import { toast } from 'sonner'

export async function getLeaderboardData()
{

    try {
      const response = await  api.get("/candidate/leaderboard")
      console.log(response.data);
      return response.data
        
    } catch (error) {

        toast.error(error.message);
        return error.data
        
    }
}
export async function getPublicProfile(userId) {
    
    try {
      const response = await  api.get(`/candidate/profile/${userId}`)

      console.log(response.data);
      return response.data
        
    } catch (error) {

        toast.error(error.message);
        return error.data
        
    }

}

export async function getCandidateSubmissions() {
  try {
    const response = await api.get('/candidate/submissions');
    console.log(response.data);
    return response.data;
  } catch (error) {
    toast.error(error.message);
    return error.response?.data;
  }
}

