type ResponseType<T> = {
    code: number,
    data: T,
    message: string
}

export default ResponseType;
// src\app\core\models\api_resp.model.ts