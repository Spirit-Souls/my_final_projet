<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\MosquesRepository;
use Symfony\Component\HttpFoundation\JsonResponse;

class MosqueController extends AbstractController
{
    #[Route('/mosque', name: 'app_mosque')]
    public function index(): Response
    {
        return $this->render('Frontend/mosque/index.html.twig', [
            'controller_name' => 'MosqueController',
        ]);
    }

    #[Route('/mosque/search', name: 'mosque_search', methods: ['GET'])]
    public function search(Request $request, MosquesRepository $mosqueRepository): JsonResponse
    {
        $query = $request->query->get('q');
        $mosques = $mosqueRepository->findByCityOrName($query);
        return $this->json($mosques);
    }

#[Route('/mosque/location', name: 'mosque_location', methods: ['GET'])]
public function getLocation(Request $request, MosquesRepository $mosqueRepository): JsonResponse
{
    $id = $request->query->get('id');
    $mosque = $mosqueRepository->find($id);

    if (!$mosque) {
        return $this->json(['error' => 'Mosquée non trouvée'], 404);
    }

    return $this->json([
        'latitude' => $mosque->getLatitude(),
        'longitude' => $mosque->getLongitude(),
    ]);
}
}