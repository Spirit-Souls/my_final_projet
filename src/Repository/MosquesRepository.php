<?php

namespace App\Repository;

use App\Entity\Mosques;
// MosqueRepository.php

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MosquesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Mosques::class);
    }

    public function findMosqueByNameOrCity(string $query)
    {
        return $this->createQueryBuilder('m')
            ->where('m.name LIKE :query OR m.city LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->getQuery()
            ->getResult();
    }
}
