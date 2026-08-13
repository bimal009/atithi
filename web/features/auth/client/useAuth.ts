"use client"

import { useMutation } from "@tanstack/react-query"

export const useLogin=(phoneNumber:string)=>{
    return useMutation({
        mutationFn:()
    })
}