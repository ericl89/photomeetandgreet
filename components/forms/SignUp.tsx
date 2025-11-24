'use client'
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Button} from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {SignUpInputs} from "@/app/types";
import axios from "axios";

export default function SignUp() {
    const {
        register,
        handleSubmit,
        watch,
        control,
        getValues,
        formState: { errors },
    } = useForm<SignUpInputs>()
    const onSubmit: SubmitHandler<SignUpInputs> = (data) => {
        console.log(data)
        axios.post('/api/member/auth/register', data)
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const role = watch("role", "photographer")

    console.log("role", role)

    return (
        <div className="not-prose mx-auto max-w-[530px] p-8">
            <div className="mb-8 text-center">
                <h1 className="mb-2 font-semibold text-3xl tracking-tight">
                    Sign up
                </h1>
                <p className="text-balance text-muted-foreground">
                    Fill out the form below to create an account to sign-in at the next event
                </p>
            </div>

            <Card>
                <CardContent>
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="event-name">First Name</Label>
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field }) => <Input
                                            id="first-name"
                                            placeholder="Enter your first name"
                                            required
                                            {...field}
                                        />}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="organizer">Last Name</Label>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        render={({ field }) => <Input
                                            id="last-name"
                                            placeholder="Enter your last name"
                                            required
                                            {...field}
                                        />}
                                    />
                                </div>
                            </div>

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
                                <Label htmlFor="organizer">Role</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value, ref } }) => <Select onValueChange={onChange} value={value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Roles</SelectLabel>
                                                <SelectItem value="photographer">Photographer</SelectItem>
                                                <SelectItem value="model">Model</SelectItem>
                                                <SelectItem value="both">Both</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>}
                                />
                            </div>

                            {role === "model" &&
                                <div className="space-y-2">
                                    <Label htmlFor="organizer">Modeling Alias</Label>
                                    <Controller
                                        name="workingName"
                                        control={control}
                                        render={({ field }) => <Input
                                            id="working-name"
                                            placeholder="Enter the name you use for modeling"
                                            required
                                            {...field}
                                        />}
                                    />
                                </div>
                            }

                            <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Social Media</CardTitle>
                                <CardDescription>Where can we see your work?</CardDescription>
                            </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="event-name">Instagram</Label>
                                                <Controller
                                                    name="instagram"
                                                    control={control}
                                                    render={({ field }) => <Input
                                                        id="instagram"
                                                        placeholder="Instagram @"
                                                        required
                                                        {...field}
                                                    />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="organizer">TikTok</Label>
                                                <Controller
                                                    name="tiktok"
                                                    control={control}
                                                    render={({ field }) => <Input
                                                        id="tiktok"
                                                        placeholder="TikTok @"
                                                        required
                                                        {...field}
                                                    />}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mt-2">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="event-name">Facebook</Label>
                                                <Controller
                                                    name="facebook"
                                                    control={control}
                                                    render={({ field }) => <Input
                                                        id="facebook"
                                                        placeholder="Facebook @"
                                                        required
                                                        {...field}
                                                    />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="organizer">X</Label>
                                                <Controller
                                                    name="twitter"
                                                    control={control}
                                                    render={({ field }) => <Input
                                                        id="tiktok"
                                                        placeholder="X @"
                                                        required
                                                        {...field}
                                                    />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <Label htmlFor="organizer">Password</Label>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => <Input
                                        type="password"
                                        id="password"
                                        placeholder="Choose a strong password"
                                        required
                                        {...field}
                                    />}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organizer">Re-enter Password</Label>
                                <Controller
                                    name="passwordConfirm"
                                    control={control}
                                    render={({ field }) => <Input
                                        type="password"
                                        id="passwordConfirm"
                                        placeholder="Re-enter your password"
                                        required
                                        {...field}
                                    />}
                                />
                            </div>


                            <div className="space-y-2">
                                <Button onClick={handleSubmit(onSubmit)} className="w-full">Register</Button>
                            </div>

                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}