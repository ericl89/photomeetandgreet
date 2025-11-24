'use client'

import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AdminLoginInputs} from "@/app/types";
import Link from "next/link";
import axios from "axios";
import {useRouter, useSearchParams} from "next/navigation";
import {sanitizeNext} from "@/lib/utils";
import {useMemo} from "react";

export default function Login() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = useMemo(()=>{ return sanitizeNext(sp.get("redirect")) ?? "/member";},[]) // default destination

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<AdminLoginInputs>()
    const onSubmit: SubmitHandler<AdminLoginInputs> = (data) => {
        axios.post('/api/member/auth/login', data)
            .then(function (response) {
                console.log("response: ",response);
                router.replace(next);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    return (
        <div className="not-prose mx-auto max-w-[530px] p-8">
            <div className="mb-8 text-center">
                <h1 className="mb-2 font-semibold text-3xl tracking-tight">
                    Login
                </h1>
                <p className="text-balance text-muted-foreground">
                    Login to your account to edit your profile, sign-in to an event, etc!
                </p>
            </div>

            <Card>
                <CardContent>
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="organizer">Email Address</Label>
                                <Controller
                                    name="emailAddress"
                                    control={control}
                                    render={({ field }) => <Input
                                        type="email"
                                        id="email-address"
                                        placeholder="Enter your email address"
                                        required
                                        {...field}
                                    />}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizer">Password</Label>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => <Input
                                        type="password"
                                        id="password"
                                        placeholder="Enter your password"
                                        required
                                        {...field}
                                    />}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 my-3">
                            <Button onClick={handleSubmit(onSubmit)} className="w-full">Login</Button>
                        </div>
                        <div className="space-y-2 text-xs text-center">
                            Don&#39;t have an account? <Link href={'/signup'}>Register</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )}