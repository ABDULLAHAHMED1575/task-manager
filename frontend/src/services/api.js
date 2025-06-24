import axios from 'axios';

const host = import.meta.env.HOST;
const port = import.meta.env.PORT;

const BASE_URL = `httpl://${host}:${port}`;

const api = axios.create({
    baseURL:BASE_URL,
    headers:{
        'Content-Type':'application/json',
    }
})

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) =>{
        let errorMessage = 'Something went wrong';

        if(error.response){
            const {status, data} = error.response;
            if(data && data.detail){
                errorMessage = data.detail;
            }else if(status === 404){
                errorMessage = "Not Found";
            }else if(status === 500){
                errorMessage = 'Internal Server Error';
            }
            else if(status === 400){
                errorMessage = "Bad Request"
            }
        }else if (error.request) {
            errorMessage = 'Network error - check your connection';
        }
        return Promise.reject(new Error(errorMessage));
    }
);

export default api;