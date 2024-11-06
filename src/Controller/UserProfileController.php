<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\UserProfileType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class UserProfileController extends AbstractController
{
    #[Route('/profile', name: 'user_profile')]
    public function edit(Request $request, EntityManagerInterface $entityManager, UserInterface $user): Response
    {
        // Créez le formulaire et liez-le aux données de l'utilisateur
        $form = $this->createForm(UserProfileType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();
            $this->addFlash('success', 'Profil mis à jour avec succès.');

            return $this->redirectToRoute('user_profile');
        }

        // Passez la vue du formulaire au template
        return $this->render('user/profile.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
