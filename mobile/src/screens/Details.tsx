import { useEffect, useState } from "react";
import { Share } from "react-native";
import { HStack, useToast, VStack } from "native-base";
import { useRoute } from "@react-navigation/native";

import { api } from "../services/api";

import { Header } from "../components/Header";
import { Option } from "../components/Option";
import { Loading } from "../components/Loading";
import { Guesses } from "../components/Guesses";
import { PoolHeader } from "../components/PoolHeader";
import { PoolCardProps } from "../components/PoolCard";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";

interface RouteParams {
  id: string;
}

export function Details() {
  const [isOptionSelected, setIsOptionSelected] = useState<'guesses' | 'ranking'>('guesses');
  const [isLoading, setIsLoading] = useState(true);
  const [poolDetails, setPoolDetails] = useState<PoolCardProps>({} as PoolCardProps);

  const route = useRoute();
  const toast = useToast();

  const { id } = route.params as RouteParams;

  async function fetchPoolsDetails() {
    try {
      setIsLoading(true);

      const response = await api.get(`/pools/${id}`);
      setPoolDetails(response.data.pool);
    
    } catch (error) {
      console.log(error);

      toast.show({
        title: 'Não foi possivel carregar os detalhes do bolão',
        placement: 'top',
        color: 'red.500'
      });
    
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeShare() {
    await Share.share({
      message: poolDetails.code,
    })
  }

  useEffect(() => {
    fetchPoolsDetails();
  },[id])

  if (isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={poolDetails.title}
        onShare={handleCodeShare}
        showBackButton 
        showShareButton
      />

      { poolDetails._count?.participants > 0 ?
        (
        <VStack px={5} flex={1}>
          <PoolHeader data={poolDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              title="Seus palpites"
              isSelected={isOptionSelected === 'guesses'}
              onPress={() => setIsOptionSelected('guesses')}
            />

            <Option
              title="Ranking do grupo"
              isSelected={isOptionSelected === 'ranking'}
              onPress={() => setIsOptionSelected('ranking')}
            />
          </HStack>

          <Guesses poolId={poolDetails.id} code={poolDetails.code} />
        </VStack>
        )
        : <EmptyMyPoolList code={poolDetails.code} />
      }
      
    </VStack>
    
  );
}