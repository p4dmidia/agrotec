import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, ShoppingCart, Plus, Minus, Trash2, Package, Leaf, Wrench, Shield } from "lucide-react";

const categories = [
  { id: "all", name: "Todos", icon: Package },
  { id: "seeds", name: "Sementes", icon: Leaf },
  { id: "fertilizers", name: "Fertilizantes", icon: Leaf },
  { id: "tools", name: "Ferramentas", icon: Wrench },
  { id: "pesticides", name: "Defensivos", icon: Shield },
  { id: "mudas", name: "Mudas", icon: Leaf },
];

export default function Store() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/store/products", selectedCategory],
  });

  const { data: cart } = useQuery({
    queryKey: ["/api/store/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      setAddingToCartId(data.productId);
      const response = await apiRequest("POST", "/api/store/cart", data);
      return response.json();
    },
    onSuccess: () => {
      setAddingToCartId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/store/cart"] });
      toast({
        title: "Produto adicionado",
        description: "Item adicionado ao carrinho com sucesso!",
      });
    },
    onError: () => {
      setAddingToCartId(null);
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async (data: { id: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/store/cart/${data.id}`, { quantity: data.quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/store/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/cart"] });
      toast({
        title: "Item removido",
        description: "Produto removido do carrinho!",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/store/checkout");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/cart"] });
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      toast({
        title: "Compra realizada!",
        description: `Pedido ${data.orderId} confirmado com sucesso!`,
      });
    },
  });

  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const cartTotal = cart?.reduce((total: number, item: any) => 
    total + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;

  const cartItemsCount = cart?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(cartItemId);
    } else {
      updateCartMutation.mutate({ id: cartItemId, quantity: newQuantity });
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Package;
  };

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Loja Agrícola" subtitle="Produtos especializados para agricultura" />
      
      <div className="p-6">
        {/* Search and Cart */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setIsCartOpen(true)}
            className="relative ml-4"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Carrinho
            {cartItemsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-4"></div>
                          <div className="h-6 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product: any) => {
                    const CategoryIcon = getCategoryIcon(product.category);
                    return (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                          <div className="aspect-square bg-gray-100 relative overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="flex items-center">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {categories.find(c => c.id === product.category)?.name}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4">
                          <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                          <CardDescription className="text-sm mb-4 line-clamp-2">
                            {product.description}
                          </CardDescription>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-green-600">
                                R$ {parseFloat(product.price).toFixed(2)}
                              </span>
                              {product.inStock ? (
                                <Badge variant="outline" className="ml-2 text-green-600">
                                  Em estoque
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="ml-2 text-red-600">
                                  Fora de estoque
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            className="w-full mt-4"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={!product.inStock || addingToCartId === product.id}
                          >
                            {addingToCartId === product.id ? "Adicionando..." : "Adicionar ao Carrinho"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar sua busca ou selecionar outra categoria
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Cart Dialog */}
        <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Carrinho de Compras</DialogTitle>
              <DialogDescription>
                Revise seus itens antes de finalizar a compra
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-96 overflow-y-auto">
              {cart?.length ? (
                <div className="space-y-4">
                  {cart.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">{item.product.description}</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {parseFloat(item.product.price).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCartMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Seu carrinho está vazio</p>
                </div>
              )}
            </div>
            
            {cart?.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsCartOpen(false)} className="flex-1">
                    Continuar Comprando
                  </Button>
                  <Button 
                    onClick={() => setIsCheckoutOpen(true)} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Finalizar Compra
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Checkout Dialog */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Compra</DialogTitle>
              <DialogDescription>
                Confirme sua compra de R$ {cartTotal.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Resumo do Pedido</h4>
                <div className="space-y-2">
                  {cart?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Simulação de Pagamento:</strong> Esta é uma demonstração. 
                  Em uma aplicação real, aqui seria integrado um gateway de pagamento.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {checkoutMutation.isPending ? "Processando..." : "Confirmar Compra"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
