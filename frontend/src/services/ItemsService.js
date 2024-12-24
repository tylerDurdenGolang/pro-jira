import $api from "../http";

export default class ItemsService {

    static async Create(category_id, title, description, status) {
        return $api.post(`/api/items/${category_id}`, {
            title,
            description,
            status
        });
    }
    

    static async GetAll(category_id) {
        return $api.get(`/api/items/${category_id}`)
    }

    static async Update(id, title, description, status) {
        return $api.put(`/api/items/${id}`, {title, description, status})
    }

    static async Delete(id){
        return $api.delete(`/api/items/${id}`)
    }

}