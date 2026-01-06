
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";


async function seedAdmin() {
    try{
        //admin info
        const adminData = {
            name:"Admin2 Sir",
            email:"admin2@admin.com",
            role: UserRole.ADMIN,
            password:"admin123"
        }

        //check user exist on db or not
        const existingUser = await prisma.user.findUnique({
            where:{
                email:adminData.email
            }
        })

        if(existingUser){
            throw new Error("User already exists!!!!")
        }
        //creating admin
        const signUpAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify(adminData)
        })
        console.log(signUpAdmin);

        //when signUpAdmin value is ok = true
        if(signUpAdmin.ok){
            await prisma.user.update({
                where:{
                    email:adminData.email
                },
                data:{
                    emailVerified: true
                }
            })
        }

    }catch(error){
        console.log(error);
    }
}
seedAdmin()