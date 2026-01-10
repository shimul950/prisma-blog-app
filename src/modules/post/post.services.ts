import { promise } from "better-auth/*";
import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}


const getAllPost = async (
    { search, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder }:
        {
            search: string | undefined,
            tags: string[] | [],
            isFeatured: boolean | undefined,
            status: PostStatus | undefined,
            authorId: string | undefined,
            page: number,
            limit: number,
            skip: number,
            sortBy: string,
            sortOrder: string
        }) => {
    const andConditions: PostWhereInput[] = []

    if (search) {
        andConditions.push(
            {
                OR: [
                    {
                        title: {
                            contains: search as string,
                            mode: "insensitive"
                        }
                    },
                    {
                        content: {
                            contains: search as string,
                            mode: "insensitive"
                        }
                    },
                    {
                        tags: {
                            has: search as string
                        }
                    }
                ]
            }
        )
    }

    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: tags as string[]
            }
        })
    }

    if (typeof isFeatured === 'boolean') {
        andConditions.push({
            isFeatured
        })
    }

    if (status) {
        andConditions.push({
            status
        })
    }

    if (authorId) {
        andConditions.push({
            authorId
        })
    }

    //pagination and sorting
    const allPost = await prisma.post.findMany({
        skip,
        take: limit,
        where: {
            AND: andConditions
        },
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });

    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })
    return {
        data: allPost,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

const getPostById = async (postId: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        const postData = await tx.post.findUnique({
            where: {
                id: postId,
            },

            include: {
                comments: {
                    where: {
                        parentId: null
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            include: {
                                replies: true
                            }
                        }
                    }
                }
            }
        })
        return postData;
    })
    return result
}


const getMyPost = async (authorId: string) => {
    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: "ACTIVE"
        }
    })
    return await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })


}

/*
    USER --> A user can update his post, but he is not eligible to update the isFeatured option
    ADMIN --> An admin can update all post options. 
 */

const updateOwnPost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }

    })
    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("you are not the owner of this post")
    }

    if (!isAdmin) {
        delete data.isFeatured
    }

    return await prisma.post.update({
        where: {
            id: postId
        },
        data
    })
}

/** 
 * user => A user can delete his own created post only.
 * admin => A admin can delete any post.
*/

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }

    })
    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("you are not the owner of this post")
    }

    return await prisma.post.delete({
        where: {
            id: postId
        }
    })
}


// Statistics
const getStats = async () => {
    // postCount, publishedPosts, draftPosts, totalComments, totalViews
    return await prisma.$transaction(async (tx) => {

        const [totalPost, totalPublishedPost, totalDraftPost, totalArchivedPost, totalComments, totalApprovedComment, totalUserAdmin, totalAdmin, totalUser, totalViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({where: {status: PostStatus.PUBLISHED}}),
            await tx.post.count({where: {status: PostStatus.DRAFT} }),
            await tx.post.count({where: { status: PostStatus.ARCHIVED }}),
            await tx.comment.count(),
            await tx.comment.count({where:{status:CommentStatus.APPROVED}}),
            await tx.user.count(),
            await tx.user.count({where:{role:UserRole.ADMIN}}),
            await tx.user.count({where:{role:UserRole.USER}}),
            await tx.post.aggregate({
                _sum:{views:true}
            })
        ])

        // const totalPost = await tx.post.count();
        // const totalPublishedPost = await tx.post.count({
        //     where: {
        //         status: PostStatus.PUBLISHED
        //     }
        // })
        // const totalDraftPost = await tx.post.count({
        //     where: {
        //         status: PostStatus.DRAFT
        //     }
        // })
        // const totalArchivedPost = await tx.post.count({
        //     where: {
        //         status: PostStatus.ARCHIVED
        //     }
        // })

        return {
            totalPost,
            totalArchivedPost,
            totalDraftPost,
            totalPublishedPost,
            totalComments,
            totalApprovedComment,
            totalUserAdmin,
            totalAdmin,
            totalUser,
            totalViews: totalViews._sum.views
        }
    })
}


export const postServices = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost,
    updateOwnPost,
    deletePost,
    getStats
}