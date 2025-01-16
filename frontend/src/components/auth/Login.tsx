import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

import signupImage from "../../assets/signup_login.svg";
import { login } from "../../services/users";
import { setLogin } from "../../store/auth-slice";
import { loginSchema } from "../../schemas/userSchema";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { mutate } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return login({ email, password });
    },
    onSuccess: (data) => {
      if (data?.userWithoutPassword && data?.token) {
        dispatch(
          setLogin({
            user: data.userWithoutPassword,
            token: data.token,
          })
        );
        navigate("/");
      }
      console.log(data);
    },
  });

  console.log("storage", localStorage.getItem("account"));

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: { email: string; password: string }) => {
    mutate(data);
  };

  return (
    <section className="flex justify-center h-screen md:items-start ">
      <section className="relative w-1/2 flex flex-col hidden md:block">
        <section>
          <h1 className="text-2xl text-[#27984c] font-bold my-4">
            Faça seu login e vamos às compras
          </h1>
          <p className="text-lg text-gray-400 font-light  my-4">
            Os melhores preços estão aqui!
          </p>
        </section>
        <img src={signupImage} className="w-full h-full object-cover" />
      </section>

      <section className=" md:w-1/2 flex flex-col md:p-20 ">
        <h1 className="text-lg text-[#060606] font-semibold"></h1>
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-slate-600">Login</h3>
          <p className="text-sm mb-2 text-slate-600">
            Bem-vindo(a)! Por favor insira seus dados
          </p>
          <section className="flex flex-col">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: "Insira um email valido",
                  },
                  required: {
                    value: true,
                    message: "Email é obrigatorio",
                  },
                })}
                className="w-full text-black py-2 my-2 pl-10 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              {errors.email?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email?.message}
                </p>
              )}
              <MdOutlineAlternateEmail className="absolute left-2 top-4 w-5 h-5 text-gray-400" />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Senha"
                {...register("password", {
                  required: {
                    value: true,
                    message: "Senha é obrigatoria",
                  },
                  minLength: {
                    value: 6,
                    message: "Senha deve contar ao menos 6 caracteres",
                  },
                })}
                className="w-full text-black py-2 my-2 pl-10 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              {errors.password?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password?.message}
                </p>
              )}
              <RiLockPasswordLine className="absolute left-2 top-4 w-5 h-5 text-gray-400" />
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Ainda não possui conta?{" "}
              <a
                href="/signup"
                className="text-[#27984c] font-semibold hover:underline"
              >
                Cadastre-se
              </a>
            </p>
          </section>

          <section className="w-full flex flex-col my-4">
            <button
              type="submit"
              disabled={!isValid}
              onClick={handleSubmit(onSubmit)}
              className="w-full text-white font-bold bg-[#27984c] rounded-md p-4 text-center flex items-center justify-center cursor-pointer"
            >
              Entrar
            </button>
          </section>
        </section>
      </section>
    </section>
  );
};
