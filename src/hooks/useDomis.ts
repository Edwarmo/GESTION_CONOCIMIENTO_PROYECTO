import { useState, useEffect } from 'react';
import domisData from '../data/domis.json';

interface Domi {
  barrio: string;
  tarifa: number;
}

const domisArray: Domi[] = domisData as Domi[];

export const useDomis = () => {
  const [domis, setDomis] = useState<Domi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDomis(domisArray);
      setLoading(false);
    }, 100);
  }, []);

  return {
    domis,
    loading
  };
};
