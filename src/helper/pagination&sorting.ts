

type IOptions ={
    page?:string |number;
    limit?:string |number;
    sortOrder?:string;
    sortBy?:string
}
//return type
type IOptionsResult ={
    page:number;
    limit:number;
    skip:number;
    sortBy:string;
    sortOrder:string;
} 
const paginationSortingHelper=(options:IOptions)=>{
    const page = Number(options.page) || 1;
    const limit= Number(options.limit) || 10;
    const skip = (page -1)* limit;

    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";

    return{
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }
}

export default paginationSortingHelper