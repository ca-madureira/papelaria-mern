import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../schemas/productSchema";
import { createProduct, updateProduct } from "../services/products";
import { getAllCategories } from "../services/categories";
import { FaPlusCircle, FaFileImage } from "react-icons/fa";
import { GrUploadOption } from "react-icons/gr";
import ProductTable from "../components/ProductTable";
import { useRef, useState } from "react";

interface ProductData {
  _id?: string;
  title: string;
  description: string;
  category: { _id: string; name: string }; // A categoria agora será uma string (_id da categoria)
  price: number;
  stock: number;
  image: string | null;
}

interface Category {
  _id: string;
  name: string;
}

export const Products = () => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<null | ProductData>(
    null
  );

  const { data } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const { mutate, status } = useMutation({
    mutationFn: (productData: ProductData) => createProduct(productData),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const { mutate: editMutate, status: editStatus } = useMutation({
    mutationFn: ({
      id,
      title,
      description,
      category,
      price,
      stock,
      image,
    }: {
      id: string;
      title: string;
      description: string;
      category: { _id: string; name: string }; // Categoria agora é só o _id (string)
      price: number;
      stock: number;
      image: string;
    }) => {
      return updateProduct({
        id,
        title,
        description,
        category,
        price,
        stock,
        image,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleEdit = (product: ProductData) => {
    setEditingProduct(product);
    setValue("title", product.title);
    setValue("description", product.description);
    setValue("category", product.category); // Agora apenas o _id da categoria
    setValue("price", product.price);
    setValue("stock", product.stock);
    setValue("image", product.image);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: { _id: "", name: "" }, // O valor inicial é uma string vazia
      price: 0,
      stock: 0,
      image: null,
    },
  });

  const onSubmit = async (data: ProductData) => {
    const price = parseFloat(data.price.toString().replace(",", "."));

    const stock = parseInt(data.stock.toString(), 10);

    const productData = {
      title: data.title,
      description: data.description,
      category: data.category, // Aqui passamos o _id da categoria (agora uma string)
      price,
      stock,
      image: data.image,
    };

    if (editingProduct) {
      if (!editingProduct._id) {
        throw new Error("O produto não tem um _id válido.");
      }

      editMutate({
        ...productData,
        id: editingProduct._id,
        image: productData.image || "",
      });
    } else {
      mutate(productData);
    }
  };

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const image = watch("image");
  const isLoading = status === "pending" || editStatus === "pending";

  return (
    <main className="flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
        <button
          type="submit"
          className="flex items-center md:self-end md:w-[18%] w-[82%] ml-2 gap-2 text-white hover:text-[#27984c] bg-[#27984c] hover:bg-white text-white font-medium mr-[8%] mt-6 border border-[#27984c] p-2"
        >
          <FaPlusCircle />
          {isLoading
            ? "Salvando..."
            : editingProduct
            ? "Salvar Edição"
            : "Adicionar Produto"}
        </button>

        <section className="flex flex-col md:flex-row justify-evenly">
          <section className="bg-slate-100 rounded-md mx-2 md:mx-20 mt-10 p-4 w-[82%] md:w-2/4">
            <legend className="text-sm font-medium text-slate-800">
              Informações gerais
            </legend>
            <label
              htmlFor="title"
              className="block text-sm/6 font-light text-gray-900"
            >
              Nome:
            </label>
            <input
              id="title"
              type="text"
              placeholder="Escreva o nome do produto"
              className="outline-none bg-zinc-200 w-full h-[6vh] text-sm font-light text-gray-900 p-2"
              {...register("title")}
            />
            {errors.title && (
              <span className="text-red-500">{errors.title.message}</span>
            )}

            <label
              htmlFor="description"
              className="block text-sm/6 font-light text-gray-900"
            >
              Descrição:
            </label>
            <textarea
              id="description"
              rows={4}
              cols={5}
              placeholder="Escreva a descrição do produto"
              className="outline-none bg-zinc-200 w-full h-[12vh] text-sm font-light text-gray-900 p-2 resize-none"
              {...register("description")}
            />
            {errors.description && (
              <span className="text-red-500">{errors.description.message}</span>
            )}

            <label
              htmlFor="category"
              className="block text-sm/6 font-light text-gray-900"
            >
              Categoria:
            </label>
            <select
              id="category"
              {...register("category")}
              className="outline-none bg-zinc-200 w-[40vw] md:w-[10vw] h-[6vh] text-sm font-light text-gray-900 p-2"
            >
              <option value="">Selecione</option>
              {data?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-red-500">{errors.category.message}</span>
            )}

            <div className="flex gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="price"
                  className="block text-sm/6 font-light text-gray-900"
                >
                  Preço:
                </label>
                <div className="flex items-center bg-zinc-200 pl-3 outline-gray-300 w-[30vw] md:w-[6vw]">
                  <input
                    id="price"
                    type="number" // Alterado de text para number
                    step="0.01" // Permite valores decimais
                    placeholder="R$ X,XXX.XX"
                    className="outline-none bg-zinc-200 w-full h-[6vh] text-sm font-light text-gray-900"
                    {...register("price", { valueAsNumber: true })} // Adicionando valueAsNumber
                  />
                </div>
                {errors.price && (
                  <span className="text-red-500">{errors.price.message}</span>
                )}
              </div>
              <div className="flex flex-col">
                <select
                  id="stock"
                  {...(register("stock"), { valueAsNumber: true })}
                  className="outline-none bg-zinc-200 w-[40vw] md:w-[10vw] h-[6vh] text-sm font-light text-gray-900 p-2"
                >
                  <option value="">Selecione</option>
                  {[100, 150, 200, 250, 300, 350].map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.stock && (
                  <span className="text-red-500">{errors.stock.message}</span>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-2 mx-4 justify-between bg-slate-100 rounded-md mt-10 p-4 w-[80%] md:w-1/4">
            {errors.image && (
              <span className="text-red-500">{errors.image.message}</span>
            )}
            <legend className="text-sm font-medium text-slate-800">
              Adicionar imagem
            </legend>
            {image ? (
              <div className="mt-4 rounded-md">
                <img
                  src={image}
                  alt="Pré-visualização"
                  className="h-[28vh] rounded-md"
                />
              </div>
            ) : (
              <FaFileImage className="w-24 h-24 text-gray-300 self-center" />
            )}

            <button
              type="button"
              className="flex items-center justify-center gap-2 border-2 border-[#27984c] hover:bg-white hover:text-[#27984c] bg-[#27984c] text-white font-medium p-2"
              onClick={() => inputFileRef.current?.click()}
            >
              <GrUploadOption className="" /> Carregar
            </button>

            <input
              ref={inputFileRef}
              id="image"
              type="file"
              className="hidden"
              onChange={handleImageChange}
            />
          </section>
        </section>
      </form>

      <section className="ml-28 w-[85%]">
        <ProductTable handleEdit={handleEdit} />
      </section>
    </main>
  );
};
