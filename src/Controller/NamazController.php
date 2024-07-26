<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class NamazController extends AbstractController
{
    #[Route('/namaz', name: 'app_namaz')]
    public function index(): Response
    {
        return $this->render('Frontend/namaz/index.html.twig', [
            'controller_name' => 'NamazController',
        ]);
    }
}
