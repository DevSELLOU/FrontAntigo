'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { FilterDrawer, FilterField } from '@/components/shared/filter-drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MonthYearPicker } from '../shared/dashboard/month-year-picker'

/** Strips accents before matching, so `cmdk`'s built-in filter treats "sao paulo" and "São
 * Paulo" as the same query (DESIGN §4: search ignores accents). */
function commandFilter(value: string, search: string): number {
  const normalize = (text: string) => text.normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '').toLowerCase()
  return normalize(value).includes(normalize(search)) ? 1 : 0
}

interface CommonResponse<T> {
  data: T
}

interface Customer {
  id: number
  name: string
}

interface Seller {
  id: number
  name: string
}

interface Manager {
  id: number
  name: string
}

const parseStatesFromUrl = (stateParam: string | null): string[] => {
  if (!stateParam) return [];
  return decodeURIComponent(stateParam)
    .replace(/%2C/g, ',')
    .split(',')
    .filter(s => s.trim() !== '');
}

const formatStatesForUrl = (states: string[]): string => {
  return states.join(',');
}

const parseCitiesFromUrl = (cityParam: string | null): string[] => {
  if (!cityParam) return [];
  return decodeURIComponent(cityParam).replace(/%2C/g, ',').split(',').filter(c => c.trim() !== '');
}

const formatCitiesForUrl = (cities: string[]): string => cities.join(',');

const parseProductsFromUrl = (productParam: string | null): string[] => {
  if (!productParam) return [];
  return decodeURIComponent(productParam).replace(/%2C/g, ',').split(',').filter(p => p.trim() !== '');
}

const formatProductsForUrl = (products: string[]): string => products.join(',');

const parseCustomerIdsFromUrl = (customerParam: string | null): number[] => {
  if (!customerParam) return [];
  return decodeURIComponent(customerParam).split(',').map(Number).filter(id => !isNaN(id));
}

const formatCustomerIdsForUrl = (customers: Customer[]): string => customers.map(c => c.id).join(',');

const parseSellerIdsFromUrl = (sellerParam: string | null): number[] => {
  if (!sellerParam) return [];
  return decodeURIComponent(sellerParam).split(',').map(Number).filter(id => !isNaN(id));
}

const formatSellerIdsForUrl = (sellers: Seller[]): string => sellers.map(s => s.id).join(',');

const parseManagerIdsFromUrl = (managerParam: string | null): number[] => {
  if (!managerParam) return [];
  return decodeURIComponent(managerParam).split(',').map(Number).filter(id => !isNaN(id));
}

const formatManagerIdsForUrl = (managers: Manager[]): string => managers.map(m => m.id).join(',');

interface DashboardFiltersProps {
  companyId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardFilters({ companyId, open, onOpenChange }: DashboardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedMonths, setSelectedMonths] = useState<Date[]>([])
  const [selectedYears, setSelectedYears] = useState<number[]>([])

  const [selectedStates, setSelectedStates] = useState<string[]>(
    parseStatesFromUrl(searchParams.get('state'))
  )
  const [states, setStates] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>(
    parseCitiesFromUrl(searchParams.get('cities'))
  )
  const [cities, setCities] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    parseProductsFromUrl(searchParams.get('products'))
  )
  const [products, setProducts] = useState<string[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedSellers, setSelectedSellers] = useState<Seller[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedManagers, setSelectedManagers] = useState<Manager[]>([])
  const [managers, setManagers] = useState<Manager[]>([])

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false)
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false)
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false)
  const [isSellerPopoverOpen, setIsSellerPopoverOpen] = useState(false)
  const [isManagerPopoverOpen, setIsManagerPopoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState({ states: false, cities: false, products: false, customers: false, sellers: false, managers: false })

  // The 6 lists below (states/cities/products/customers/sellers/managers) used to fetch on
  // every page load, even for people who never open the filter at all. Gating on the drawer's
  // first open avoids 6 requests nobody asked for.
  const [hasOpened, setHasOpened] = useState(false)
  useEffect(() => {
    if (open) setHasOpened(true)
  }, [open])

  useEffect(() => {
    const monthsParam = searchParams.get('months')
    const yearsParam = searchParams.get('years')

    // Authoritative from the URL either way — the earlier version only ever set these when the
    // param was present, so clearing the filter (via "Limpar" or the browser Back button) left
    // the drawer showing a selection that no longer matched the URL.
    setSelectedMonths(
      monthsParam
        ? monthsParam.split(',').map(monthStr => {
            const [year, month] = monthStr.split('-').map(Number)
            return new Date(year, month - 1, 1)
          })
        : []
    )
    setSelectedYears(yearsParam ? yearsParam.split(',').map(Number) : [])

    setSelectedStates(parseStatesFromUrl(searchParams.get('state')))
    setSelectedCities(parseCitiesFromUrl(searchParams.get('cities')))
    setSelectedProducts(parseProductsFromUrl(searchParams.get('products')))

    // These three depend on the async lists (id -> {id,name}) having loaded — but still need to
    // go back to [] when the param is gone, not just when it's present.
    const customerIds = parseCustomerIdsFromUrl(searchParams.get('customers'))
    setSelectedCustomers(customerIds.length > 0 ? customers.filter(c => customerIds.includes(c.id)) : [])

    const sellerIds = parseSellerIdsFromUrl(searchParams.get('sellers'))
    setSelectedSellers(sellerIds.length > 0 ? sellers.filter(s => sellerIds.includes(s.id)) : [])

    const managerIds = parseManagerIdsFromUrl(searchParams.get('managers'))
    setSelectedManagers(managerIds.length > 0 ? managers.filter(m => managerIds.includes(m.id)) : [])
  }, [searchParams, customers, sellers, managers])

  useEffect(() => {
    if (!hasOpened) return
    const fetchStates = async () => {
      try {
        setIsLoading(prev => ({ ...prev, states: true }))
        const response = await fetch(`/api/locations/states?companyId=${companyId}`)
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de estados.')
        }

        const { data } = await response.json() as CommonResponse<string[]>
        if (Array.isArray(data)) {
          const uniqueStates = Array.from(new Set(['Todos os Estados', ...data]))
          setStates(uniqueStates)
        }
      } catch (error) {
        console.error('Erro ao buscar estados:', error)
      } finally {
        setIsLoading(prev => ({ ...prev, states: false }))
      }
    }
    fetchStates()
  }, [companyId, hasOpened])

  useEffect(() => {
    if (!hasOpened) return
    const fetchCities = async () => {
      try {
        setIsLoading(prev => ({ ...prev, cities: true }));
        const response = await fetch(`/api/locations/cities?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de cidades.');
        }

        const { data } = await response.json() as CommonResponse<string[]>;
        if (Array.isArray(data)) {
          const uniqueCities = Array.from(new Set(['Todas as Cidades', ...data]));
          setCities(uniqueCities);
        }
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, cities: false }));
      }
    };

    fetchCities();
  }, [companyId, hasOpened]);

  useEffect(() => {
    if (!hasOpened) return
    const fetchProducts = async () => {
      try {
        setIsLoading(prev => ({ ...prev, products: true }));
        const response = await fetch(`/api/locations/products?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de produtos.');
        }

        const { data } = await response.json() as CommonResponse<string[]>;
        if (Array.isArray(data)) {
          const uniqueProducts = Array.from(new Set(['Todos os Produtos', ...data]));
          setProducts(uniqueProducts);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, [companyId, hasOpened]);

  useEffect(() => {
    if (!hasOpened) return
    const fetchCustomers = async () => {
      try {
        setIsLoading(prev => ({ ...prev, customers: true }));
        const response = await fetch(`/api/locations/customers?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de clientes.');
        }

        const { data } = await response.json() as CommonResponse<Customer[]>;
        if (Array.isArray(data)) {
          const allCustomersOption: Customer = { id: -1, name: 'Todos os Clientes' };
          const uniqueCustomers = [allCustomersOption, ...data];
          setCustomers(uniqueCustomers);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, customers: false }));
      }
    };
    fetchCustomers();
  }, [companyId, hasOpened]);

  useEffect(() => {
    if (!hasOpened) return
    const fetchSellers = async () => {
      try {
        setIsLoading(prev => ({ ...prev, sellers: true }));
        const response = await fetch(`/api/locations/sellers?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de vendedores.');
        }

        const { data } = await response.json() as CommonResponse<Seller[]>;
        if (Array.isArray(data)) {
          const allSellersOption: Seller = { id: -1, name: 'Todos os Vendedores' };
          const uniqueSellers = [allSellersOption, ...data];
          setSellers(uniqueSellers);
        }
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, sellers: false }));
      }
    };
    fetchSellers();
  }, [companyId, hasOpened]);

  useEffect(() => {
    if (!hasOpened) return
    const fetchManagers = async () => {
      try {
        setIsLoading(prev => ({ ...prev, managers: true }));
        const response = await fetch(`/api/locations/managers?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de gerentes.');
        }

        const { data } = await response.json() as CommonResponse<Manager[]>;
        if (Array.isArray(data)) {
          const allManagersOption: Manager = { id: -1, name: 'Todos os Gerentes' };
          const uniqueManagers = [allManagersOption, ...data];
          setManagers(uniqueManagers);
        }
      } catch (error) {
        console.error('Erro ao buscar gerentes:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, managers: false }));
      }
    };
    fetchManagers();
  }, [companyId, hasOpened]);

  const handleStateSelect = (value: string) => {
    if (value === "Todos os Estados") {
      const newSelection = selectedStates.includes("Todos os Estados") ? [] : ["Todos os Estados"];
      setSelectedStates(newSelection);
      return;
    }
    
    const currentStates = selectedStates.filter(s => s !== "Todos os Estados");
    
    if (currentStates.includes(value)) {      // Remove state
      setSelectedStates(currentStates.filter((s) => s !== value));
    } else {
      setSelectedStates([...currentStates, value]);
    }
  };

  const handleRemoveState = (value: string) => {
    setSelectedStates(selectedStates.filter((s) => s !== value));
  };
  
  const handleCitySelect = (value: string) => {
    if (value === "Todas as Cidades") {
      const newSelection = selectedCities.includes("Todas as Cidades") ? [] : ["Todas as Cidades"];
      setSelectedCities(newSelection);
      return;
    }

    const currentCities = selectedCities.filter(c => c !== "Todas as Cidades");

    if (currentCities.includes(value)) {
      setSelectedCities(currentCities.filter((c) => c !== value));
    } else {
      setSelectedCities([...currentCities, value]);
    }
  };

  const handleRemoveCity = (value: string) => {
    setSelectedCities(selectedCities.filter(c => c !== value));
  };

  const handleProductSelect = (value: string) => {
    if (value === "Todos os Produtos") {
      const newSelection = selectedProducts.includes("Todos os Produtos") ? [] : ["Todos os Produtos"];
      setSelectedProducts(newSelection);
      return;
    }

    const currentProducts = selectedProducts.filter(p => p !== "Todos os Produtos");

    if (currentProducts.includes(value)) {
      setSelectedProducts(currentProducts.filter((p) => p !== value));
    } else {
      setSelectedProducts([...currentProducts, value]);
    }
  };

  const handleRemoveProduct = (value: string) => {
    setSelectedProducts(selectedProducts.filter(p => p !== value));
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (customer.id === -1) { // "Todos os Clientes"
      const newSelection = selectedCustomers.some(c => c.id === -1) ? [] : [customer];
      setSelectedCustomers(newSelection);
      return;
    }

    const currentCustomers = selectedCustomers.filter(c => c.id !== -1);

    if (currentCustomers.some(c => c.id === customer.id)) {
      setSelectedCustomers(currentCustomers.filter((c) => c.id !== customer.id));
    } else {
      setSelectedCustomers([...currentCustomers, customer]);
    }
  };

  const handleRemoveCustomer = (customer: Customer) => {
    setSelectedCustomers(selectedCustomers.filter(c => c.id !== customer.id));
  };

  const handleSellerSelect = (seller: Seller) => {
    if (seller.id === -1) { // "Todos os Vendedores"
      const newSelection = selectedSellers.some(s => s.id === -1) ? [] : [seller];
      setSelectedSellers(newSelection);
      return;
    }

    const currentSellers = selectedSellers.filter(s => s.id !== -1);

    if (currentSellers.some(s => s.id === seller.id)) {
      setSelectedSellers(currentSellers.filter((s) => s.id !== seller.id));
    } else {
      setSelectedSellers([...currentSellers, seller]);
    }
  };

  const handleRemoveSeller = (seller: Seller) => {
    setSelectedSellers(selectedSellers.filter(s => s.id !== seller.id));
  };

  const handleManagerSelect = (manager: Manager) => {
    if (manager.id === -1) { // "Todos os Gerentes"
      const newSelection = selectedManagers.some(m => m.id === -1) ? [] : [manager];
      setSelectedManagers(newSelection);
      return;
    }

    const currentManagers = selectedManagers.filter(m => m.id !== -1);

    if (currentManagers.some(m => m.id === manager.id)) {
      setSelectedManagers(currentManagers.filter((m) => m.id !== manager.id));
    } else {
      setSelectedManagers([...currentManagers, manager]);
    }
  };

  const handleRemoveManager = (manager: Manager) => {
    setSelectedManagers(selectedManagers.filter(m => m.id !== manager.id));
  };



  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (selectedMonths.length > 0) {
      const monthsParam = selectedMonths
        .map(date => format(date, 'yyyy-MM')).join(',');
      params.set('months', monthsParam);
    } else {
      params.delete('months')
    }

    if (selectedYears.length > 0) {
      params.set('years', selectedYears.join(','))
    } else {
      params.delete('years')
    }

    const statesToFilter = selectedStates.filter(s => s !== 'Todos os Estados')

    if (statesToFilter.length > 0) {
      params.set('state', formatStatesForUrl(statesToFilter))
    } else {
      params.delete('state')
    }

    const citiesToFilter = selectedCities.filter(c => c !== 'Todas as Cidades');

    if (citiesToFilter.length > 0) {
      params.set('cities', formatCitiesForUrl(citiesToFilter));
    } else {
      params.delete('cities');
    }

    const productsToFilter = selectedProducts.filter(p => p !== 'Todos os Produtos');

    if (productsToFilter.length > 0) {
      params.set('products', formatProductsForUrl(productsToFilter));
    } else {
      params.delete('products');
    }

    const customersToFilter = selectedCustomers.filter(c => c.id !== -1);

    if (customersToFilter.length > 0) {
      params.set('customers', formatCustomerIdsForUrl(customersToFilter));
    } else {
      params.delete('customers');
    }

    const sellersToFilter = selectedSellers.filter(s => s.id !== -1);

    if (sellersToFilter.length > 0) {
      params.set('sellers', formatSellerIdsForUrl(sellersToFilter));
    } else {
      params.delete('sellers');
    }

    const managersToFilter = selectedManagers.filter(m => m.id !== -1);

    if (managersToFilter.length > 0) {
      params.set('managers', formatManagerIdsForUrl(managersToFilter));
    } else {
      params.delete('managers');
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    const params = new URLSearchParams()
    const currentTab = searchParams.get('tab')
    if (currentTab) params.set('tab', currentTab)
    setSelectedMonths([])
    setSelectedYears([])
    setSelectedStates([])
    setSelectedCities([])
    setSelectedProducts([])
    setSelectedCustomers([])
    setSelectedSellers([])
    setSelectedManagers([])
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleMonthSelect = (date: Date) => {
    setSelectedMonths(prev => {
      const dateExists = prev.some(d => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth());
      if (dateExists) {
        return prev.filter(d => d.getFullYear() !== date.getFullYear() || d.getMonth() !== date.getMonth());
      } else {
        return [...prev, date];
      }
    });
  }

  const handleYearSelect = (year: number) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year];
      }
    });
  }

  const handleRemoveMonth = (date: Date) => {
    setSelectedMonths(selectedMonths.filter(d => d.getTime() !== date.getTime()));
  }

  const handleRemoveYear = (year: number) => {
    setSelectedYears(selectedYears.filter(y => y !== year));
  }

  const renderDateTriggerContent = () => {
    if (selectedMonths.length === 0 && selectedYears.length === 0) {
      return <span className="text-muted-foreground">Mês/Ano</span>;
    }

    const monthText = selectedMonths.length > 0 ? `${selectedMonths.length} ${selectedMonths.length > 1 ? 'meses' : 'mês'}` : '';
    const yearText = selectedYears.length > 0 ? `${selectedYears.length} ${selectedYears.length > 1 ? 'anos' : 'ano'}` : '';

    return [monthText, yearText].filter(Boolean).join(' e ');
  }

  const renderStateTriggerContent = () => {
    if (selectedStates.length === 0) {
      return <span className="text-muted-foreground">Estado(s)</span>;
    }
    
    if (selectedStates.includes("Todos os Estados")) {
      return <span className="font-semibold">Todos os Estados Selecionados</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedStates.map((state) => {
          const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleRemoveState(state);
          };
          return (
            <Badge key={state} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto">
              {state}
              <button
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                onClick={onRemove}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderCityTriggerContent = () => {
    if (selectedCities.length === 0) {
      return <span className="text-muted-foreground">Cidade(s)</span>;
    }

    if (selectedCities.includes("Todas as Cidades")) {
      return <span className="font-semibold">Todas as Cidades Selecionadas</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedCities.map((city) => {
          const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleRemoveCity(city);
          };
          return (
            <Badge key={city} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto">
              {city}
              <button type="button" className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors" onClick={onRemove}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderProductTriggerContent = () => {
    if (selectedProducts.length === 0) {
      return <span className="text-muted-foreground">Produto(s)</span>;
    }

    if (selectedProducts.includes("Todos os Produtos")) {
      return <span className="font-semibold">Todos os Produtos Selecionados</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedProducts.map((product) => {
          const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleRemoveProduct(product);
          };
          return (
            <Badge key={product} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto">
              {product}
              <button type="button" className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors" onClick={onRemove}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderCustomerTriggerContent = () => {
    if (selectedCustomers.length === 0) {
      return <span className="text-muted-foreground">Cliente(s)</span>;
    }

    if (selectedCustomers.some(c => c.id === -1)) {
      return <span className="font-semibold">Todos os Clientes Selecionados</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedCustomers.map((customer) => {
          const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleRemoveCustomer(customer);
          };
          return (
            <Badge key={customer.id} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto">
              {customer.name}
              <button type="button" className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors" onClick={onRemove}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderSellerTriggerContent = () => {
    if (selectedSellers.length === 0) {
      return <span className="text-muted-foreground">Vendedor(es)</span>;
    }

    if (selectedSellers.some(s => s.id === -1)) {
      return <span className="font-semibold">Todos os Vendedores Selecionados</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedSellers.map((seller) => {
          const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleRemoveSeller(seller);
          };
          return (
            <Badge key={seller.id} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto">
              {seller.name}
              <button type="button" className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors" onClick={onRemove}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderManagerTriggerContent = () => {
    if (selectedManagers.length === 0) {
      return <span className="text-muted-foreground">Gerente(s)</span>;
    }

    if (selectedManagers.some(m => m.id === -1)) {
      return <span className="font-semibold">Todos os Gerentes Selecionados</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedManagers.map((manager) => {
          const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleRemoveManager(manager);
          };
          return (
            <Badge key={manager.id} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto">
              {manager.name}
              <button type="button" className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors" onClick={onRemove}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Filtrar indicadores'
      subtitle='O recorte vale para todas as abas do dashboard.'
      onApply={() => {
        handleApplyFilters()
        onOpenChange(false)
      }}
      onClear={() => {
        handleClearFilters()
        onOpenChange(false)
      }}
    >
      <FilterField label='Mês / Ano'>
        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal', !selectedMonths.length && !selectedYears.length && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              <div className="flex-1 text-left line-clamp-1">
                {renderDateTriggerContent()}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[320px] p-0' align='start' collisionPadding={16}>
            <MonthYearPicker
              onMonthSelect={handleMonthSelect}
              onYearSelect={handleYearSelect}
              selectedMonths={selectedMonths}
              selectedYears={selectedYears}
              mode="multiple"
            />
          </PopoverContent>
        </Popover>
        {(selectedMonths.length > 0 || selectedYears.length > 0) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {[...selectedMonths].sort((a,b) => a.getTime() - b.getTime()).map(date => (
              <Badge key={date.toISOString()} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto justify-between">
                {format(date, 'MMM yyyy')}
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  onClick={() => handleRemoveMonth(date)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {[...selectedYears].sort().map(year => (
              <Badge key={year} variant="secondary" className="pl-2 pr-1.5 py-0.5 text-xs h-auto justify-between">
                {year}
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  onClick={() => handleRemoveYear(year)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </FilterField>

      <FilterField label='Estado(s)'>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isPopoverOpen}
              className="w-full justify-between h-auto min-h-[40px] p-2"
            >
              <div className="flex-1 text-left line-clamp-1">
                {renderStateTriggerContent()}
              </div>
              {isLoading.states ? (
                <Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
              ) : (
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command filter={commandFilter}>
              <CommandInput placeholder='Buscar…' />
              <CommandList>
                <CommandEmpty>Nada encontrado.</CommandEmpty>
                <CommandGroup>
                  {states.map((state) => (
                    <CommandItem
                      key={state}
                      value={state}
                      onSelect={() => handleStateSelect(state)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedStates.includes(state) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {state}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FilterField>

      <FilterField label='Cidade(s)'>
        <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isCityPopoverOpen}
              className="w-full justify-between h-auto min-h-[40px] p-2"
            >
              <div className="flex-1 text-left line-clamp-1">
                {renderCityTriggerContent()}
              </div>
              {isLoading.cities ? (
                <Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
              ) : (
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command filter={commandFilter}>
              <CommandInput placeholder='Buscar…' />
              <CommandList>
                <CommandEmpty>Nada encontrado.</CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem key={city} value={city} onSelect={() => handleCitySelect(city)} className="cursor-pointer">
                      <Check
                        className={cn('mr-2 h-4 w-4', selectedCities.includes(city) ? 'opacity-100' : 'opacity-0')}
                      />
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FilterField>

      <FilterField label='Produto(s)'>
        <Popover open={isProductPopoverOpen} onOpenChange={setIsProductPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isProductPopoverOpen}
              className="w-full justify-between h-auto min-h-[40px] p-2"
            >
              <div className="flex-1 text-left line-clamp-1">
                {renderProductTriggerContent()}
              </div>
              {isLoading.products ? (
                <Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
              ) : (
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command filter={commandFilter}>
              <CommandInput placeholder='Buscar…' />
              <CommandList>
                <CommandEmpty>Nada encontrado.</CommandEmpty>
                <CommandGroup>
                  {products.map((product) => (
                    <CommandItem key={product} value={product} onSelect={() => handleProductSelect(product)} className="cursor-pointer">
                      <Check
                        className={cn('mr-2 h-4 w-4', selectedProducts.includes(product) ? 'opacity-100' : 'opacity-0')}
                      />
                      {product}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FilterField>

      <FilterField label='Cliente(s)'>
        <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isCustomerPopoverOpen}
              className="w-full justify-between h-auto min-h-[40px] p-2"
            >
              <div className="flex-1 text-left line-clamp-1">
                {renderCustomerTriggerContent()}
              </div>
              {isLoading.customers ? (
                <Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
              ) : (
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command filter={commandFilter}>
              <CommandInput placeholder='Buscar…' />
              <CommandList>
                <CommandEmpty>Nada encontrado.</CommandEmpty>
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem key={customer.id} value={customer.name} onSelect={() => handleCustomerSelect(customer)} className="cursor-pointer">
                      <Check
                        className={cn('mr-2 h-4 w-4', selectedCustomers.some(c => c.id === customer.id) ? 'opacity-100' : 'opacity-0')}
                      />
                      {customer.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FilterField>

      <FilterField label='Vendedor(es)'>
        <Popover open={isSellerPopoverOpen} onOpenChange={setIsSellerPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isSellerPopoverOpen}
              className="w-full justify-between h-auto min-h-[40px] p-2"
            >
              <div className="flex-1 text-left line-clamp-1">
                {renderSellerTriggerContent()}
              </div>
              {isLoading.sellers ? (
                <Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
              ) : (
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command filter={commandFilter}>
              <CommandInput placeholder='Buscar…' />
              <CommandList>
                <CommandEmpty>Nada encontrado.</CommandEmpty>
                <CommandGroup>
                  {sellers.map((seller) => (
                    <CommandItem key={seller.id} value={seller.name} onSelect={() => handleSellerSelect(seller)} className="cursor-pointer">
                      <Check
                        className={cn('mr-2 h-4 w-4', selectedSellers.some(s => s.id === seller.id) ? 'opacity-100' : 'opacity-0')}
                      />
                      {seller.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FilterField>

      <FilterField label='Gerente(s)'>
        <Popover open={isManagerPopoverOpen} onOpenChange={setIsManagerPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isManagerPopoverOpen}
              className="w-full justify-between h-auto min-h-[40px] p-2"
            >
              <div className="flex-1 text-left line-clamp-1">
                {renderManagerTriggerContent()}
              </div>
              {isLoading.managers ? (
                <Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
              ) : (
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command filter={commandFilter}>
              <CommandInput placeholder='Buscar…' />
              <CommandList>
                <CommandEmpty>Nada encontrado.</CommandEmpty>
                <CommandGroup>
                  {managers.map((manager) => (
                    <CommandItem key={manager.id} value={manager.name} onSelect={() => handleManagerSelect(manager)} className="cursor-pointer">
                      <Check
                        className={cn('mr-2 h-4 w-4', selectedManagers.some(m => m.id === manager.id) ? 'opacity-100' : 'opacity-0')}
                      />
                      {manager.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FilterField>
    </FilterDrawer>
  )
}
