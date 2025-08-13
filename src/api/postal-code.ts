import request from '../utils/request';

export interface PostalCodeParams {
    level: number;
    parentId: number;
}

export const fetchPostalCodeList = (data: PostalCodeParams) => {
    return request({
        url: '/postal-code/list',
        method: 'post',
        data
    });
};
