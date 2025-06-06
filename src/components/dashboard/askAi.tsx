import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../../service/config';


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export const askAI = async (prompt: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const result = await model.generateContent(prompt)
        const response = result.response.text()
        return response

    } catch (error) {
        throw error
    }
}
