<?php

namespace App\Repository;

use App\Entity\Mosques;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MosquesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Mosques::class);
    }

    public function findByCityOrName(string $query): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.name LIKE :query')
            ->orWhere('m.city LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->getQuery()
            ->getArrayResult();
    }
}
