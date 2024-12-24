import $api from "../http";

export default class CategoriesService {

    static async Create(name) {
        return $api.post('/api/categories/', {name})
    }

    static async GetAll() {
        return $api.get('/api/categories/')
    }

    static async GetById(id) {
        return $api.get(`/api/categories/${id}`)
    }

    static async Update(id, name) {
        return $api.put(`/api/categories/${id}`, {name})
    }

    static async Delete(id) {
        return $api.delete(`/api/categories/${id}`) //Todo Сделать удаление по Id
    }

}