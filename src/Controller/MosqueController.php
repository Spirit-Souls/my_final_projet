<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MosqueController extends AbstractController
{
    #[Route('/mosque', name: 'app_mosque')]
    public function index(): Response
    {
        return $this->render('Frontend/mosque/index.html.twig', [
            'controller_name' => 'MosqueController',
        ]);
    }
}
